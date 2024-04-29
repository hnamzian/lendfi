// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract Lending is Ownable {
    using Math for uint256;

    struct Loan {
        address borrower;
        uint256 loanAmount;
        uint256 collateralTokenId;
        uint256 interestRate;
        uint256 loanDuration;
        uint256 dueDate;
        bool isRepaid;
        bool isDefaulted;
    }

    IERC721 public nftContract;
    mapping(uint256 => address) public loanProposals;
    mapping(uint256 => uint256) public collateralMapping;
    mapping(uint256 => Loan) public loans;

    uint256 public proposalCounter = 1;
    uint256 public loanCounter = 1;

    event LoanProposed(uint256 proposalId, address borrower, uint256 collateralTokenId);
    event LoanApproved(uint256 proposalId, uint256 loanId);
    event LoanCreated(uint256 loanId, address borrower, uint256 loanAmount, uint256 duration, uint256 interestRate);
    event LoanRepaid(uint256 loanId);
    event LoanDefaulted(uint256 loanId);

    constructor(address _nftContract) Ownable(msg.sender) {
        nftContract = IERC721(_nftContract);
    }

    function requestLoan(uint256 collateralTokenId) external {
        require(nftContract.ownerOf(collateralTokenId) == msg.sender, "Not owner of NFT.");

        uint256 proposalId = proposalCounter++;
        loanProposals[proposalId] = msg.sender;
        collateralMapping[proposalId] = collateralTokenId;

        emit LoanProposed(proposalId, msg.sender, collateralTokenId);
    }

    function proposeLoan(
        uint256 proposalId,
        uint256 loanAmount,
        uint256 interestRate,
        uint256 loanDuration
    ) public {
        require(loanProposals[proposalId] != address(0), "Invalid proposal.");

        uint256 collateralTokenId = collateralMapping[proposalId];

        Loan storage loan = loans[loanCounter];

        loan.borrower = loanProposals[proposalId];
        loan.loanAmount = loanAmount;
        loan.collateralTokenId = collateralTokenId;
        loan.interestRate = interestRate;
        loan.loanDuration = loanDuration;
        
        bool ok;
        (ok, loan.dueDate) = block.timestamp.tryAdd(loanDuration);
        require(ok, "Invalid Loan Duration");

        loan.isRepaid = false;
        loan.isDefaulted = false;

        emit LoanApproved(proposalId, loanCounter);

        loanCounter++;
    }

    function approveLoan(uint256 loanId) external payable {
        Loan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Only borrower can approve.");

        nftContract.transferFrom(msg.sender, address(this), loan.collateralTokenId);

        payable(loan.borrower).transfer(loan.loanAmount);

        emit LoanCreated(loanId, loan.borrower, loan.loanAmount, loan.loanDuration, loan.interestRate);
    }

    function repayLoan(uint256 loanId) external payable {
        Loan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Only borrower can repay.");
        require(!loan.isRepaid, "Loan already repaid.");
        require(!loan.isDefaulted, "Loan already defaulted.");

        bool ok;
        uint256 totalRepayment;
        totalRepayment = loan.loanAmount.mulDiv(loan.interestRate, 10000);
        (ok, totalRepayment) = loan.loanAmount.tryAdd(totalRepayment);
        require(ok, "Failed to calculate total Repayment");

        require(msg.value == totalRepayment, "Incorrect repayment amount.");

        payable(address(this)).transfer(totalRepayment);

        nftContract.safeTransferFrom(address(this), loan.borrower, loan.collateralTokenId);
        loan.isRepaid = true;

        emit LoanRepaid(loanId);
    }

    function applyPenalty(uint256 loanId) public {
        Loan storage loan = loans[loanId];
        require(!loan.isRepaid, "Loan already repaid.");

        if (block.timestamp > loan.dueDate) {
            loan.isDefaulted = true;
            emit LoanDefaulted(loanId);
        }
    }

    receive() external payable {} 
}

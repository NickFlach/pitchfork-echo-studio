// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PitchforkFunding
 * @dev Smart contract for transparent, decentralized funding of resistance campaigns
 * @notice This contract enables activists to create funding campaigns and receive donations
 */
contract PitchforkFunding {
    struct Campaign {
        string title;
        string description;
        address payable creator;
        uint256 goalAmount;
        uint256 raisedAmount;
        uint256 deadline;
        bool isActive;
        bool goalReached;
        mapping(address => uint256) contributions;
        address[] contributors;
    }

    struct Contributor {
        address contributor;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Contributor[]) public campaignContributions;
    uint256 public campaignCounter;
    
    // Events for transparency
    event CampaignCreated(
        uint256 indexed campaignId,
        string title,
        address indexed creator,
        uint256 goalAmount,
        uint256 deadline
    );
    
    event ContributionMade(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount,
        uint256 timestamp
    );
    
    event CampaignCompleted(
        uint256 indexed campaignId,
        uint256 totalRaised,
        bool goalReached
    );
    
    event FundsWithdrawn(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 amount
    );

    modifier onlyActiveCampaign(uint256 _campaignId) {
        require(campaigns[_campaignId].isActive, "Campaign is not active");
        require(block.timestamp < campaigns[_campaignId].deadline, "Campaign deadline passed");
        _;
    }

    modifier onlyCampaignCreator(uint256 _campaignId) {
        require(msg.sender == campaigns[_campaignId].creator, "Only campaign creator can perform this action");
        _;
    }

    /**
     * @dev Create a new funding campaign
     * @param _title Campaign title
     * @param _description Campaign description
     * @param _goalAmount Target funding amount in wei
     * @param _durationDays Campaign duration in days
     */
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goalAmount,
        uint256 _durationDays
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_goalAmount > 0, "Goal amount must be greater than 0");
        require(_durationDays > 0, "Duration must be greater than 0");

        uint256 campaignId = campaignCounter++;
        Campaign storage newCampaign = campaigns[campaignId];
        
        newCampaign.title = _title;
        newCampaign.description = _description;
        newCampaign.creator = payable(msg.sender);
        newCampaign.goalAmount = _goalAmount;
        newCampaign.raisedAmount = 0;
        newCampaign.deadline = block.timestamp + (_durationDays * 1 days);
        newCampaign.isActive = true;
        newCampaign.goalReached = false;

        emit CampaignCreated(
            campaignId,
            _title,
            msg.sender,
            _goalAmount,
            newCampaign.deadline
        );

        return campaignId;
    }

    /**
     * @dev Contribute to a campaign
     * @param _campaignId ID of the campaign to contribute to
     */
    function contribute(uint256 _campaignId) 
        external 
        payable 
        onlyActiveCampaign(_campaignId) 
    {
        require(msg.value > 0, "Contribution must be greater than 0");
        
        Campaign storage campaign = campaigns[_campaignId];
        
        // Record contribution
        if (campaign.contributions[msg.sender] == 0) {
            campaign.contributors.push(msg.sender);
        }
        
        campaign.contributions[msg.sender] += msg.value;
        campaign.raisedAmount += msg.value;
        
        // Add to contribution history
        campaignContributions[_campaignId].push(Contributor({
            contributor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        // Check if goal is reached
        if (campaign.raisedAmount >= campaign.goalAmount && !campaign.goalReached) {
            campaign.goalReached = true;
        }

        emit ContributionMade(_campaignId, msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Withdraw funds from a campaign (creator only)
     * @param _campaignId ID of the campaign
     */
    function withdrawFunds(uint256 _campaignId) 
        external 
        onlyCampaignCreator(_campaignId) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.raisedAmount > 0, "No funds to withdraw");
        require(
            campaign.goalReached || block.timestamp >= campaign.deadline,
            "Cannot withdraw: goal not reached and campaign still active"
        );

        uint256 amount = campaign.raisedAmount;
        campaign.raisedAmount = 0;
        campaign.isActive = false;

        // Transfer funds to creator
        campaign.creator.transfer(amount);

        emit FundsWithdrawn(_campaignId, campaign.creator, amount);
        emit CampaignCompleted(_campaignId, amount, campaign.goalReached);
    }

    /**
     * @dev Get campaign details
     * @param _campaignId ID of the campaign
     */
    function getCampaign(uint256 _campaignId) 
        external 
        view 
        returns (
            string memory title,
            string memory description,
            address creator,
            uint256 goalAmount,
            uint256 raisedAmount,
            uint256 deadline,
            bool isActive,
            bool goalReached,
            uint256 contributorCount
        ) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.title,
            campaign.description,
            campaign.creator,
            campaign.goalAmount,
            campaign.raisedAmount,
            campaign.deadline,
            campaign.isActive,
            campaign.goalReached,
            campaign.contributors.length
        );
    }

    /**
     * @dev Get contribution amount for a specific contributor
     * @param _campaignId ID of the campaign
     * @param _contributor Address of the contributor
     */
    function getContribution(uint256 _campaignId, address _contributor) 
        external 
        view 
        returns (uint256) 
    {
        return campaigns[_campaignId].contributions[_contributor];
    }

    /**
     * @dev Get all contributors for a campaign
     * @param _campaignId ID of the campaign
     */
    function getContributors(uint256 _campaignId) 
        external 
        view 
        returns (address[] memory) 
    {
        return campaigns[_campaignId].contributors;
    }

    /**
     * @dev Get contribution history for a campaign
     * @param _campaignId ID of the campaign
     */
    function getContributionHistory(uint256 _campaignId) 
        external 
        view 
        returns (Contributor[] memory) 
    {
        return campaignContributions[_campaignId];
    }

    /**
     * @dev Emergency function to deactivate a campaign (creator only)
     * @param _campaignId ID of the campaign
     */
    function deactivateCampaign(uint256 _campaignId) 
        external 
        onlyCampaignCreator(_campaignId) 
    {
        campaigns[_campaignId].isActive = false;
        emit CampaignCompleted(_campaignId, campaigns[_campaignId].raisedAmount, campaigns[_campaignId].goalReached);
    }

    /**
     * @dev Get total number of campaigns
     */
    function getTotalCampaigns() external view returns (uint256) {
        return campaignCounter;
    }

    /**
     * @dev Check if campaign deadline has passed
     * @param _campaignId ID of the campaign
     */
    function isDeadlinePassed(uint256 _campaignId) external view returns (bool) {
        return block.timestamp >= campaigns[_campaignId].deadline;
    }
}

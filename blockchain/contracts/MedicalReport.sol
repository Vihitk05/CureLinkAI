// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalReport {
    struct Report {
        string reportHash; // IPFS hash of the medical report
        address doctor;
        bool isApproved;
    }

    mapping(address => Report[]) public reportsByPatient;

    // Event for storing the report
    event ReportAdded(address indexed patient, string reportHash, address doctor);
    event ReportApproved(address indexed patient, string reportHash);

    // Function for a doctor to add a report
    function addReport(address patient, string memory reportHash) public {
        reportsByPatient[patient].push(Report(reportHash, msg.sender, false));
        emit ReportAdded(patient, reportHash, msg.sender);
    }

    // Function for the patient to approve the report
    function approveReport(uint reportIndex) public {
        require(reportIndex < reportsByPatient[msg.sender].length, "Invalid report index");
        reportsByPatient[msg.sender][reportIndex].isApproved = true;
        emit ReportApproved(msg.sender, reportsByPatient[msg.sender][reportIndex].reportHash);
    }

    // Function to get all reports for a patient
    function getReports(address patient) public view returns (Report[] memory) {
        return reportsByPatient[patient];
    }
}

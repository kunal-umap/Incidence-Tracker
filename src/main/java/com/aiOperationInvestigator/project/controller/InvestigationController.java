package com.aiOperationInvestigator.project.controller;

import com.aiOperationInvestigator.project.service.InvestigationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/incidents")
public class InvestigationController {

    @Autowired
    InvestigationService investigationService;

    @GetMapping(value = "/")
    public String investigateIncident(@RequestParam("incidentDescription") String incidentDescription){
        return investigationService.investigationData(incidentDescription);
    }

}

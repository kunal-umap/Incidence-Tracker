package com.aiOperationInvestigator.project.controller;

import com.aiOperationInvestigator.project.service.InvestigationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/v1/incidents")
@CrossOrigin(origins = {
        "http://localhost:8080"
})
public class InvestigationController {

    @Autowired
    InvestigationService investigationService;

    @GetMapping(value = "/")
    public String investigateIncident(@RequestParam("incidentDescription") String incidentDescription){
        return investigationService.investigationData(incidentDescription);
    }

}

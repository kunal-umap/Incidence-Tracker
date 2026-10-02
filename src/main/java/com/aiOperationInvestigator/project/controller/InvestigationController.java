package com.aiOperationInvestigator.project.controller;

import com.aiOperationInvestigator.project.service.InvestigationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/v1/incidents")
public class InvestigationController {

    @Autowired
    InvestigationService investigationService;

    @GetMapping(value = "/", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public String investigateIncident(){
        return investigationService.investigationData();
    }

}

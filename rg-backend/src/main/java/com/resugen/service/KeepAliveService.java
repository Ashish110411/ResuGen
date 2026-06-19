package com.resugen.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class KeepAliveService {

    private static final Logger logger = LoggerFactory.getLogger(KeepAliveService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Scheduled(fixedRate = 1800000) // 30 minute in millisecond 
    public void pingSelf() {
        try {
            logger.info("Sending keep-alive ping to self...");
            String url = "https://resugen.onrender.com/api/auth/ping";
            String response = restTemplate.getForObject(url, String.class);
            logger.info("Keep-alive ping response: {}", response);
        } catch (Exception e) {
            logger.error("Failed to send keep-alive ping: {}", e.getMessage());
        }
    }
}

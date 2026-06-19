package com.resugen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ResuGenApplication {
    public static void main(String[] args) {
        SpringApplication.run(ResuGenApplication.class, args);
    }
}

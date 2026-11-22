package com.resugen.dto;

import java.time.LocalDateTime;

public class ResumeListDto {
    private Long id;
    private String name;
    private LocalDateTime updatedAt;
    private String templateType;

    public ResumeListDto(Long id, String name, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.updatedAt = updatedAt;
        this.templateType = "sde";
    }

    public ResumeListDto(Long id, String name, LocalDateTime updatedAt, String templateType) {
        this.id = id;
        this.name = name;
        this.updatedAt = updatedAt;
        this.templateType = templateType;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getTemplateType() {
        return templateType;
    }

    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }
}

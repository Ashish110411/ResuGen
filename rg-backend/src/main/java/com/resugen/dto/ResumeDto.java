package com.resugen.dto;

public class ResumeDto {
    private Long id;
    private String name;
    private String resumeData;
    private String sectionOrder;
    private String visibleSections;
    private String vspaceSettings;

    public ResumeDto() {
    }

    public ResumeDto(Long id, String name, String resumeData, String sectionOrder, String visibleSections, String vspaceSettings) {
        this.id = id;
        this.name = name;
        this.resumeData = resumeData;
        this.sectionOrder = sectionOrder;
        this.visibleSections = visibleSections;
        this.vspaceSettings = vspaceSettings;
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

    public String getResumeData() {
        return resumeData;
    }

    public void setResumeData(String resumeData) {
        this.resumeData = resumeData;
    }

    public String getSectionOrder() {
        return sectionOrder;
    }

    public void setSectionOrder(String sectionOrder) {
        this.sectionOrder = sectionOrder;
    }

    public String getVisibleSections() {
        return visibleSections;
    }

    public void setVisibleSections(String visibleSections) {
        this.visibleSections = visibleSections;
    }

    public String getVspaceSettings() {
        return vspaceSettings;
    }

    public void setVspaceSettings(String vspaceSettings) {
        this.vspaceSettings = vspaceSettings;
    }


}

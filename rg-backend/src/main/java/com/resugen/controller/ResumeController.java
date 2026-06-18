package com.resugen.controller;

import com.resugen.dto.ResumeDto;
import com.resugen.dto.ResumeListDto;
import com.resugen.model.Resume;
import com.resugen.model.User;
import com.resugen.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    @Autowired
    private ResumeRepository resumeRepository;

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping
    public ResponseEntity<List<ResumeListDto>> getAllResumes() {
        User user = getAuthenticatedUser();
        List<Resume> resumes = resumeRepository.findByUserOrderByUpdatedAtDesc(user);
        List<ResumeListDto> dtoList = resumes.stream()
                .map(r -> new ResumeListDto(r.getId(), r.getName(), r.getUpdatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResumeById(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        Optional<Resume> resumeOpt = resumeRepository.findByIdAndUser(id, user);
        if (resumeOpt.isEmpty()) {
            return new ResponseEntity<>("Resume not found or access denied", HttpStatus.NOT_FOUND);
        }
        Resume r = resumeOpt.get();
        ResumeDto dto = new ResumeDto(r.getId(), r.getName(), r.getResumeData(), r.getSectionOrder(), r.getVisibleSections(), r.getVspaceSettings());
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<?> createResume(@RequestBody ResumeDto resumeDto) {
        User user = getAuthenticatedUser();
        Resume r = new Resume();
        r.setUser(user);
        r.setName(resumeDto.getName());
        r.setResumeData(resumeDto.getResumeData());
        r.setSectionOrder(resumeDto.getSectionOrder());
        r.setVisibleSections(resumeDto.getVisibleSections());
        r.setVspaceSettings(resumeDto.getVspaceSettings());

        Resume saved = resumeRepository.save(r);
        ResumeDto responseDto = new ResumeDto(saved.getId(), saved.getName(), saved.getResumeData(), saved.getSectionOrder(), saved.getVisibleSections(), saved.getVspaceSettings());
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateResume(@PathVariable Long id, @RequestBody ResumeDto resumeDto) {
        User user = getAuthenticatedUser();
        Optional<Resume> resumeOpt = resumeRepository.findByIdAndUser(id, user);
        if (resumeOpt.isEmpty()) {
            return new ResponseEntity<>("Resume not found or access denied", HttpStatus.NOT_FOUND);
        }

        Resume r = resumeOpt.get();
        r.setName(resumeDto.getName());
        r.setResumeData(resumeDto.getResumeData());
        r.setSectionOrder(resumeDto.getSectionOrder());
        r.setVisibleSections(resumeDto.getVisibleSections());
        r.setVspaceSettings(resumeDto.getVspaceSettings());

        Resume saved = resumeRepository.save(r);
        ResumeDto responseDto = new ResumeDto(saved.getId(), saved.getName(), saved.getResumeData(), saved.getSectionOrder(), saved.getVisibleSections(), saved.getVspaceSettings());
        return ResponseEntity.ok(responseDto);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResume(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        Optional<Resume> resumeOpt = resumeRepository.findByIdAndUser(id, user);
        if (resumeOpt.isEmpty()) {
            return new ResponseEntity<>("Resume not found or access denied", HttpStatus.NOT_FOUND);
        }

        resumeRepository.delete(resumeOpt.get());
        return ResponseEntity.ok("Resume deleted successfully");
    }
}

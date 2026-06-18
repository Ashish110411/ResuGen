package com.resugen.repository;

import com.resugen.model.Resume;
import com.resugen.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserOrderByUpdatedAtDesc(User user);
    Optional<Resume> findByIdAndUser(Long id, User user);
}

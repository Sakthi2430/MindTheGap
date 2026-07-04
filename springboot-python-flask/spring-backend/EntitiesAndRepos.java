package com.agent.skillgap;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

// ==========================================
// ENTITIES
// ==========================================

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

@Entity
@Table(name = "analyses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Analysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(name = "jd_text", nullable = false, columnDefinition = "TEXT")
    private String jdText;

    @Column(name = "resume_text", nullable = false, columnDefinition = "TEXT")
    private String resumeText;

    @Column(name = "readiness_score", nullable = false)
    private Integer readinessScore;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String strengths; // JSON or Comma-separated list

    @Column(columnDefinition = "TEXT") // Stores Roadmap as structured JSON string
    private String roadmap;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "analysisId")
    private List<AnalysisSkill> skills;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

@Entity
@Table(name = "analysis_skills")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "analysis_id", nullable = false)
    private Long analysisId;

    @Column(name = "skill_name", nullable = false)
    private String skillName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillStatus status;

    @Column(nullable = false)
    private Integer priority;
}

public enum SkillStatus {
    matched,
    missing,
    partial
}

// ==========================================
// REPOSITORIES
// ==========================================

@Repository
interface UserRepository extends JpaRepository<User, Long> {
    java.util.Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}

@Repository
interface AnalysisRepository extends JpaRepository<Analysis, Long> {
    List<Analysis> findByUserIdOrderByCreatedAtDesc(Long userId);
    java.util.Optional<Analysis> findByIdAndUserId(Long id, Long userId);
}

@Repository
interface AnalysisSkillRepository extends JpaRepository<AnalysisSkill, Long> {
    List<AnalysisSkill> findByAnalysisId(Long analysisId);
}

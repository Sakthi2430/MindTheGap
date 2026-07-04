package com.agent.skillgap;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

@Data
class AuthRequest {
    private String name;
    private String email;
    private String password;
}

@Data
class AuthResponse {
    private final String token;
    private final UserDto user;
}

@Data
class UserDto {
    private Long id;
    private String name;
    private String email;
}

@Data
class AnalysisRequest {
    private String resumeText;
    private String jdText;
    private String jobTitle;
}

// ==========================================
// SECURITY CONFIG & JWT UTILS
// ==========================================

@Component
class JwtUtil {
    @Value("${jwt.secret:fallback-secret-key-123456}")
    private String secret;

    @Value("${jwt.expiration:604800000}") // 7 days in ms
    private long expiration;

    public String generateToken(String email, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return getClaims(token).get("userId", Long.class);
    }

    public boolean validateToken(String token, String email) {
        return extractEmail(token).equals(email) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }

    private Claims getClaims(String token) {
        return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
    }
}

@Component
@RequiredArgsConstructor
class JwtFilter extends org.springframework.web.filter.OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(token);
            } catch (Exception e) {
                // Token invalid or expired
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            if (jwtUtil.validateToken(token, userDetails.getUsername())) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
class SecurityConfig {
    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf().disable()
                .authorizeHttpRequests()
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
                .and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

@Service
@RequiredArgsConstructor
class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPasswordHash(), new ArrayList<>()
        );
    }
}

// ==========================================
// CORE SERVICES
// ==========================================

@Service
@RequiredArgsConstructor
class AnalysisService {
    private final AnalysisRepository analysisRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ml.service.url:http://ml-service:5001}")
    private String mlServiceUrl;

    public Analysis performAnalysis(AnalysisRequest request, Long userId) {
        // Orchestrate internal call to Flask ml-service
        String url = mlServiceUrl + "/internal/analyze";
        
        Map<String, String> body = new HashMap<>();
        body.put("resumeText", request.getResumeText());
        body.put("jdText", request.getJdText());
        body.put("jobTitle", request.getJobTitle());

        // Invoke ML microservice (Flask)
        ResponseEntity<Map> response = restTemplate.postForEntity(url, body, Map.class);
        Map<String, Object> mlResult = response.getBody();

        // Map ML microservice response back into structured JPA Entities
        Integer readinessScore = (Integer) mlResult.get("readiness_score");
        String summary = (String) mlResult.get("summary");
        List<String> strengths = (List<String>) mlResult.get("strengths");
        List<Map<String, Object>> roadmapList = (List<Map<String, Object>>) mlResult.get("roadmap");
        List<Map<String, Object>> skillsList = (List<Map<String, Object>>) mlResult.get("skills");

        // Prepare JSON mappings or structured strings
        String strengthsStr = String.join(",", strengths);
        // Normally you'd use Jackson ObjectMapper to write lists to JSON strings:
        String roadmapJson = "[]"; 
        try {
            roadmapJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(roadmapList);
        } catch (Exception e) {}

        Analysis analysis = Analysis.builder()
                .userId(userId)
                .jobTitle(request.getJobTitle())
                .jdText(request.getJdText())
                .resumeText(request.getResumeText())
                .readinessScore(readinessScore)
                .summary(summary)
                .strengths(strengthsStr)
                .roadmap(roadmapJson)
                .build();

        final Analysis savedAnalysis = analysisRepository.save(analysis);

        // Convert and map skills
        if (skillsList != null) {
            List<AnalysisSkill> analysisSkills = skillsList.stream().map(sk -> {
                String skillName = (String) sk.get("skill_name");
                String status = (String) sk.get("status");
                Integer priority = (Integer) sk.get("priority");
                return AnalysisSkill.builder()
                        .analysisId(savedAnalysis.getId())
                        .skillName(skillName)
                        .status(SkillStatus.valueOf(status))
                        .priority(priority)
                        .build();
            }).toList();
            savedAnalysis.setSkills(analysisSkills);
            analysisRepository.save(savedAnalysis);
        }

        return savedAnalysis;
    }

    public List<Analysis> getHistoryForUser(Long userId) {
        return analysisRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public java.util.Optional<Analysis> getAnalysisDetail(Long id, Long userId) {
        return analysisRepository.findByIdAndUserId(id, userId);
    }
}

// ==========================================
// CONTROLLERS
// ==========================================

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getId());

        UserDto userDto = new UserDto();
        userDto.setId(saved.getId());
        userDto.setName(saved.getName());
        userDto.setEmail(saved.getEmail());

        return ResponseEntity.ok(new AuthResponse(token, userDto));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId());

        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(token, userDto));
    }
}

@RestController
@RequestMapping("/api/analyses")
@RequiredArgsConstructor
class AnalysisController {
    private final AnalysisService analysisService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> createAnalysis(@RequestBody AnalysisRequest request, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        try {
            Analysis result = analysisService.performAnalysis(request, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to compile skill gap analysis: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getHistory(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        return ResponseEntity.ok(analysisService.getHistoryForUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDetail(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        return analysisService.getAnalysisDetail(id, userId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Analysis not found")));
    }
}

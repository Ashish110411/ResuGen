package com.resugen.controller;

import com.resugen.dto.LoginRequest;
import com.resugen.dto.LoginResponse;
import com.resugen.dto.SignupRequest;
import com.resugen.model.User;
import com.resugen.repository.UserRepository;
import com.resugen.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return new ResponseEntity<>("Email Address already in use!", HttpStatus.BAD_REQUEST);
        }

        // Creating user's account
        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));

        userRepository.save(user);

        return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        User user = userOptional.get();
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        String jwt = tokenProvider.generateToken(user.getEmail());
        return ResponseEntity.ok(new LoginResponse(jwt, user.getId(), user.getName(), user.getEmail()));
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        try {
            // A simple query to keep the Aiven database active
            userRepository.count(); 
            return ResponseEntity.ok("pong");
        } catch (Exception e) {
            // If the DB was asleep and is waking up, it might throw an exception initially
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Database is waking up...");
        }
    }
}

package lk.ijse.spring.propos.service;

import lk.ijse.spring.propos.dto.AuthDTO;
import lk.ijse.spring.propos.dto.AuthResponseDTO;
import lk.ijse.spring.propos.dto.RegisterDTO;
import lk.ijse.spring.propos.entity.RefreshToken;
import lk.ijse.spring.propos.entity.Role;
import lk.ijse.spring.propos.entity.User;
import lk.ijse.spring.propos.repository.RefreshTokenRepository;
import lk.ijse.spring.propos.repository.UserRepository;
import lk.ijse.spring.propos.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtil jwtUtil;

    public AuthResponseDTO authenticate(AuthDTO authDTO){
        // validate credentials
        User user=userRepository.findByUsername(authDTO.getUsername())
                .orElseThrow(()->new RuntimeException("User not found"));
        // check password
        if (!passwordEncoder.matches(
                authDTO.getPassword(),
                user.getPassword())){
            throw new BadCredentialsException("Invalid credentials");
        }
        // generate token
        String accessToken=jwtUtil.generateToken(authDTO.username, user.getRole().name());
        String refreshToken = generateAndSaveRefreshToken(user);
        return new AuthResponseDTO(accessToken, refreshToken);
    }

    private String generateAndSaveRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .expiryDate(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000))
                .build();

        refreshTokenRepository.save(refreshToken);
        return token;
    }

    public AuthResponseDTO refreshAccessToken(String refreshToken){
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(()->new RuntimeException("Invalid refresh token"));

        if (token.getExpiryDate().before(new java.util.Date())) {
            throw new RuntimeException("Refresh token expired");
        }

        User user = token.getUser();
        String newAccessToken = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return new AuthResponseDTO(newAccessToken, refreshToken);
    }

    // register user
    public String register(RegisterDTO registerDTO){
        if (userRepository.findByUsername(registerDTO.getUsername())
                .isPresent()){
            throw new RuntimeException("Username already exists");
        }
        User user=User.builder()
                .username(registerDTO.getUsername())
                .emailAddress(registerDTO.getEmailAddress())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .role(Role.valueOf(registerDTO.getRole()))
                .build();
        userRepository.save(user);
        return "User registered successfully";
    }
}

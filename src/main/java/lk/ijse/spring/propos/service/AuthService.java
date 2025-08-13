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
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtil jwtUtil;
    private final TokenDenyListService denyListService;

    @Transactional
    public AuthResponseDTO authenticate(AuthDTO authDTO) {
        User user = userRepository.findByUsername(authDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(authDTO.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String accessToken = jwtUtil.generateToken(authDTO.getUsername(), user.getRole().name());
        String refreshToken = generateAndSaveRefreshToken(user);

        return new AuthResponseDTO(accessToken, refreshToken);
    }

    private String generateAndSaveRefreshToken(User user) {
        // Find if token already exists for this user
        Optional<RefreshToken> existingTokenOpt = refreshTokenRepository.findByUser(user);

        String token = UUID.randomUUID().toString();
        Date expiryDate = new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000);

        RefreshToken refreshToken;
        if (existingTokenOpt.isPresent()) {
            // Update existing token
            refreshToken = existingTokenOpt.get();
            refreshToken.setToken(token);
            refreshToken.setExpiryDate(expiryDate);
        } else {
            // Create new token
            refreshToken = RefreshToken.builder()
                    .token(token)
                    .user(user)
                    .expiryDate(expiryDate)
                    .build();
        }

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

//    @Transactional
//    public void logout(String refreshToken) {
//        //refreshTokenRepository.findByToken(refreshToken).ifPresent(refreshTokenRepository::delete);
//        String username = jwtUtil.extractUsername(refreshToken);
//        refreshTokenRepository.deleteByUser_Username(username);
//    }

//    @Transactional
//    public void logout(String username) {
//        refreshTokenRepository.deleteByUser_Username(username);
//    }

    @Transactional
    public void logout(String accessToken, String refreshToken) {

        if (accessToken != null && accessToken.startsWith("Bearer ")) {
            String token = accessToken.substring(7);
            String jti = jwtUtil.extractJti(token);
            java.util.Date expiry = jwtUtil.extractExpiration(token);
            denyListService.addToDenyList(jti, expiry);
        }

        if (refreshToken != null) refreshTokenRepository.deleteByToken(refreshToken);

    }
}

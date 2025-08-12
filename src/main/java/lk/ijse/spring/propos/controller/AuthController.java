package lk.ijse.spring.propos.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lk.ijse.spring.propos.dto.APIResponse;
import lk.ijse.spring.propos.dto.AuthDTO;
import lk.ijse.spring.propos.dto.AuthResponseDTO;
import lk.ijse.spring.propos.dto.RegisterDTO;
import lk.ijse.spring.propos.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<APIResponse> registerUser(
            @RequestBody RegisterDTO registerDTO){
        return ResponseEntity.ok(
                new APIResponse(
                        200,
                        "User registered successfully",
                        authService.register(registerDTO)
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO authDTO, HttpServletResponse response){
        AuthResponseDTO authResponseDTO = authService.authenticate(authDTO);

        Cookie refreshCookie = new Cookie("refreshToken", authResponseDTO.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(7*24*60*60);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok(Map.of("accessToken", authResponseDTO.getAccessToken()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No refresh token found");
        }

        AuthResponseDTO response = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(Map.of("accessToken", response.getAccessToken()));
    }

//    @PostMapping("/logout")
//    public ResponseEntity<?> logout(@CookieValue(value = "refreshToken", required = false) String refreshToken, HttpServletResponse response) {
//        if (refreshToken != null) {
//            authService.logout(refreshToken);
//        }
//
//        // Clear the refresh token cookie on the client side
//        Cookie cookie = new Cookie("refreshToken", null);
//        cookie.setHttpOnly(true);
//        cookie.setPath("/");
//        cookie.setMaxAge(0); // Set max age to 0 to delete the cookie
//        response.addCookie(cookie);
//
//        return ResponseEntity.ok("Logout successful");
//    }

//    @PostMapping("/logout")
//    public ResponseEntity<String> logout(HttpServletRequest request) {
//        String authHeader = request.getHeader("Authorization");
//
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body("Missing or invalid Authorization header");
//        }
//
//        String accessToken = authHeader.substring(7);
//        authService.logout(accessToken);
//
//        return ResponseEntity.ok("Logged out successfully");
//    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response) {
        // Extract username from the currently authenticated user
        String username = request.getUserPrincipal().getName();

        authService.logout(username);

        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // expires immediately
        response.addCookie(cookie);


        return ResponseEntity.ok("Logged out successfully");
    }
}

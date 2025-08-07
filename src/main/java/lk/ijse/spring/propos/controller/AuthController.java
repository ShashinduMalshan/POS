package lk.ijse.spring.propos.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lk.ijse.spring.propos.dto.APIResponse;
import lk.ijse.spring.propos.dto.AuthDTO;
import lk.ijse.spring.propos.dto.RegisterDTO;
import lk.ijse.spring.propos.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:63342")
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
//    @PostMapping("/login")
//    public ResponseEntity<APIResponse> login(@RequestBody AuthDTO authDTO){
//        return ResponseEntity.ok(new APIResponse(200,
//                "OK",authService.authenticate(authDTO)));
//    }

    @PostMapping("/refresh-token")
    public ResponseEntity<APIResponse> refreshToken(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");

        return ResponseEntity.ok(
                new APIResponse(200, "Access token refreshed", authService.refreshAccessToken(refreshToken))
        );
    }
//
//    @PostMapping("/auth/login")
//    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
//        // Authenticate user and generate token
//        String token = authService.generateToken(request.getEmail());
//
//
//        Cookie cookie = new Cookie("accessToken", token);
//        cookie.setHttpOnly(true);
//        cookie.setSecure(false); // Set true if using HTTPS
//        cookie.setPath("/");
//        cookie.setMaxAge(60 * 60); // 1 hour
//
//        response.addCookie(cookie);
//
//        return ResponseEntity.ok(Map.of("status", 200, "message", "OK"));


}

package lk.ijse.spring.propos.exception;

import io.jsonwebtoken.ExpiredJwtException;
import lk.ijse.spring.propos.dto.APIResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    // Exception Handler for username not found Exception
    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public APIResponse handleUserNameNotFoundException
    (UsernameNotFoundException ex){
        return new APIResponse(404, "User Not Found",null);
    }

    // Exception Handler for Bad Credentials Exception
    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public APIResponse handleBadCredentials(BadCredentialsException ex){
        return new APIResponse(400, "Bad Credentials",null);
    }

    // Exception Handler for JWT Token Expired Exception
    @ExceptionHandler(ExpiredJwtException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public APIResponse handleJWTTokenExpiredException(ExpiredJwtException ex){
        return new APIResponse(401, "JWT Token Expired",null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Forbidden: You don't have permission");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }


    // Exception Handler for all other exceptions
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public APIResponse handleAllExceptions(RuntimeException ex){
        return new APIResponse(500, "Internal Server Error",ex.getMessage());
    }

}

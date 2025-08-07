package lk.ijse.spring.propos.repository;

import lk.ijse.spring.propos.entity.RefreshToken;
import lk.ijse.spring.propos.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);
}

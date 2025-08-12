package lk.ijse.spring.propos.repository;

import lk.ijse.spring.propos.entity.RefreshToken;
import lk.ijse.spring.propos.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    void deleteByUser(User user);
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUser(User user);
    //void deleteByUser_Username(String username);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.user.username = :username")
    void deleteByUser_Username(@Param("username") String username);


}


package lk.ijse.spring.propos.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final StringRedisTemplate redisTemplate;
    private static final String BLACKLIST_PREFIX = "blacklisted_token:";

    public void blacklistToken(String token, long expirationMillis) {
        long ttlSeconds = expirationMillis / 1000;
        redisTemplate.opsForValue().set(BLACKLIST_PREFIX + token, "true", ttlSeconds, TimeUnit.SECONDS);
    }

    public boolean isTokenBlacklisted(String token) {
        return redisTemplate.hasKey(BLACKLIST_PREFIX + token);
    }
}

package com.krishihub.auth.service;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.model.CustomUserDetails;
import com.krishihub.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserPermissionService userPermissionService;

    @Override
    public UserDetails loadUserByUsername(String mobileNumber) throws UsernameNotFoundException {
        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with mobile number: " + mobileNumber));

        // Build authorities from both role and permissions
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        // Add role authority
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        
        // Add permissions from Central Authorization Service (Cached)
        userPermissionService.getUserPermissions(user.getId()).forEach(permission -> 
            authorities.add(new SimpleGrantedAuthority(permission))
        );

        return CustomUserDetails.builder()
                .id(user.getId())
                .username(user.getMobileNumber())
                .password(user.getPasswordHash() != null ? user.getPasswordHash() : "")
                .authorities(authorities)
                .userType(user.getRole())
                .district(user.getDistrict())
                .ward(user.getWard())
                .name(user.getName())
                .build();
    }
}

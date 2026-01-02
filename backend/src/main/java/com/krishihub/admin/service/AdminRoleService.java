package com.krishihub.admin.service;

import com.krishihub.admin.dto.CreateRoleRequest;
import com.krishihub.admin.dto.PermissionDto;
import com.krishihub.admin.dto.RoleDto;
import com.krishihub.auth.entity.Permission;
import com.krishihub.auth.entity.Role;
import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.PermissionRepository;
import com.krishihub.auth.repository.RoleRepository;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminRoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional
    public RoleDto createRole(CreateRoleRequest request, UUID actorId) {
        if (roleRepository.findByName(request.getName()).isPresent()) {
            throw new BadRequestException("Role already exists: " + request.getName());
        }

        Set<Permission> permissions = new HashSet<>();
        if (request.getPermissionNames() != null) {
            for (String permName : request.getPermissionNames()) {
                permissions.add(permissionRepository.findByName(permName)
                        .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + permName)));
            }
        }

        Role role = Role.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isSystemDefined(false)
                .permissions(permissions)
                .build();

        Role savedRole = roleRepository.save(role);

        // Audit
        auditService.logAction(actorId, "CREATE_ROLE", "ROLE", savedRole.getId().toString(),
                null, "SYSTEM", "INTERNAL");

        return mapToDto(savedRole);
    }

    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PermissionDto> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(permission -> PermissionDto.builder()
                        .id(permission.getId())
                        .name(permission.getName())
                        .module(permission.getModule())
                        .description(permission.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void assignRoleToUser(UUID userId, UUID roleId, UUID actorId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        user.getRoles().add(role);
        userRepository.save(user);

        auditService.logAction(actorId, "ASSIGN_ROLE", "USER", userId.toString(),
                Map.of("roleId", roleId), "SYSTEM", "INTERNAL");
    }

    private RoleDto mapToDto(Role role) {
        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .isSystemDefined(role.getIsSystemDefined())
                .permissions(role.getPermissions().stream().map(Permission::getName).collect(Collectors.toSet()))
                .build();
    }
}

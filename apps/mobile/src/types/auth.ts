export interface LoginRequest {
    identifier: string;
}

export interface VerifyOtpRequest {
    identifier: string;
    otp: string;
}

export interface UserDto {
    id: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    role: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserDto;
}

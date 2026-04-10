export interface RiskPosition {
    id: string;
    asset: string;
    position: number;
}

export interface CreateRiskPositionRequest {
    asset: string;
    position: number;
}

export interface UpdateRiskPositionRequest {
    position: number;
}

export interface ErrorResponse {
    error: string;
}

export type RiskPositionResponse = RiskPosition | ErrorResponse;
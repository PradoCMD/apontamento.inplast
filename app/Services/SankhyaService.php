<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SankhyaService
{
    private ?string $appKey;
    private ?string $username;
    private ?string $password;
    private ?string $baseUrl;
    private bool $enabled;

    public function __construct()
    {
        $this->enabled = filter_var(env('SANkHYA_ENABLED', false), FILTER_VALIDATE_BOOLEAN);
        $this->baseUrl = env('SANkHYA_URL', 'https://api.sankhya.com.br');
        $this->appKey = env('SANkHYA_APPKEY');
        $this->username = env('SANkHYA_USERNAME');
        $this->password = env('SANkHYA_PASSWORD');
    }

    public function isEnabled(): bool
    {
        return $this->enabled && !empty($this->appKey) && !empty($this->username);
    }

    public function login(): ?array
    {
        if (!$this->isEnabled()) {
            return null;
        }

        try {
            $response = Http::post($this->baseUrl . '/api/login', [
                'appKey' => $this->appKey,
                'username' => $this->username,
                'password' => $this->password,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Sankhya login failed', ['status' => $response->status()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Sankhya login error', ['message' => $e->getMessage()]);
            return null;
        }
    }

    public function syncApontamento(array $apontamento): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/api/mge/service.sbr?serviceName=PCP.GravarApontamento', [
                'apontamento' => $apontamento,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Sankhya sync error', ['message' => $e->getMessage()]);
            return false;
        }
    }

    public function getOrdensProducao(): array
    {
        if (!$this->isEnabled()) {
            return [];
        }

        try {
            $response = Http::post($this->baseUrl . '/api/mge/service.sbr?serviceName=PCP.BuscarOrdensProducao', [
                'filtro' => ['status' => 'aberta'],
            ]);

            if ($response->successful()) {
                return $response->json()['data'] ?? [];
            }
        } catch (\Exception $e) {
            Log::error('Sankhya get ordens error', ['message' => $e->getMessage()]);
        }

        return [];
    }

    public function getMaquinas(): array
    {
        if (!$this->isEnabled()) {
            return [];
        }

        try {
            $response = Http::post($this->baseUrl . '/api/mge/service.sbr?serviceName=PCP.BuscarMaquinas', []);

            if ($response->successful()) {
                return $response->json()['data'] ?? [];
            }
        } catch (\Exception $e) {
            Log::error('Sankhya get maquinas error', ['message' => $e->getMessage()]);
        }

        return [];
    }
}
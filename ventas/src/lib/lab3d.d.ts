export interface Lab3DApi {
  enfocar(id: string): void; soltar(): void; modo(m: { xray?: boolean; explode?: boolean }): void;
  mostrar(ids: string[] | null): void; aparecer(id: string): void; vista(yaw: number, pitch: number, dist?: number): void; destruir(): void;
}
export const Lab3D: { crear(host: HTMLElement, opts?: Record<string, unknown>): Lab3DApi };
export const PIEZAS: { id: string; n: string; sub: string; d: string; cuida: string[]; comp: string[] }[];

import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    name: string;
    imageUrl: string;
    price: bigint;
}
export interface backendInterface {
    addProduct(name: string, price: bigint, imageUrl: string): Promise<bigint>;
    checkAdminPassword(password: string): Promise<boolean>;
    deleteProduct(productId: bigint): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
}

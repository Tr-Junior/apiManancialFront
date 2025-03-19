import { jwtDecode } from "jwt-decode";
import { User } from "../core/models/user.model";

export class Security {
  private static sessionId: string = '';

  public static setSessionId(sessionId: string) {
    this.sessionId = sessionId;
    sessionStorage.setItem('sessionId', sessionId);
  }

  public static getSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = sessionStorage.getItem('sessionId') || '';
    }
    return this.sessionId;
  }

  private static getStorageKey(key: string): string {
    return `${this.getSessionId()}_${key}`;
  }

  public static set(user: User, token: string) {
    const data = JSON.stringify(user);
    sessionStorage.setItem(this.getStorageKey('data'), this.b64EncodeUnicode(data));
    sessionStorage.setItem(this.getStorageKey('token'), token);
  }

  public static isTokenExpired(): boolean {
    const token = this.getToken();
    if (token) {
      // Decodifica o token JWT para obter os dados, mas não verifica a expiração
      const decodedToken: any = jwtDecode(token);
      // Pode-se adicionar outras verificações ou simplesmente retornar false
      return false;
    }
    return true; // Se o token não estiver disponível, assume-se que o token tenha expirado
  }

  public static setUser(user: User) {
    const data = JSON.stringify(user);
    sessionStorage.setItem(this.getStorageKey('data'), this.b64EncodeUnicode(data));
  }

  public static setToken(token: string) {
    sessionStorage.setItem(this.getStorageKey('token'), token);
  }

  public static getUser(): User {
    const data = sessionStorage.getItem(this.getStorageKey('data'));
    if (data) {
      return JSON.parse(this.b64DecodeUnicode(data));
    } else {
      return null as any;
    }
  }

  public static getToken(): string {
    const data = sessionStorage.getItem(this.getStorageKey('token'));
    if (data) {
      return data;
    } else {
      return null as any;
    }
  }

  public static hasToken(): boolean {
    return !!this.getToken();
  }

  public static clear() {
    sessionStorage.removeItem(this.getStorageKey('data'));
    sessionStorage.removeItem(this.getStorageKey('token'));
    sessionStorage.removeItem('sessionId');
  }

  public static setPass(pass: User) {
    const data = JSON.stringify(pass);
    sessionStorage.setItem(this.getStorageKey('user'), this.b64EncodeUnicode(data));
  }

  public static getPass(): User {
    const data = sessionStorage.getItem(this.getStorageKey('user'));
    if (data) {
      return JSON.parse(this.b64DecodeUnicode(data));
    } else {
      return null as any;
    }
  }

  public static clearPass() {
    sessionStorage.removeItem(this.getStorageKey('user'));
  }

  public static hasRole(role: string): boolean {
    const user = this.getUser();
    return user && user.roles.includes(role);
  }

  private static b64EncodeUnicode(str: string): string {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(Number('0x' + p1))));
  }

  private static b64DecodeUnicode(str: string): string {
    return decodeURIComponent(Array.prototype.map.call(window.atob(str), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  }
}

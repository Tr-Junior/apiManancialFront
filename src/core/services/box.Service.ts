import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Security } from "../../utils/Security.util";

interface BoxItem {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  discount: number;
  purchasePrice: number;
}

@Injectable({
  providedIn: "root",
})
export class BoxService {
  private storageKey = "Box_Items";
  private itemsSubject = new BehaviorSubject<BoxItem[]>(this.getItemsFromStorage());
  items$ = this.itemsSubject.asObservable();

  constructor() {
    this.handleUserSession();
  }

  /**
   * Verifica se há um usuário logado e limpa o sessionStorage se necessário.
   */
  private handleUserSession(): void {
    const userId = Security.getSessionId();
    if (!userId) {
      sessionStorage.removeItem(this.storageKey);
      this.itemsSubject.next([]);
      console.log("Nenhum usuário logado. Itens apagados do sessionStorage.");
    }
  }

  /**
   * Obtém os itens do sessionStorage.
   */
  private getItemsFromStorage(): BoxItem[] {
    const storedItems = sessionStorage.getItem(this.storageKey);
    return storedItems ? JSON.parse(storedItems) : [];
  }

  /**
   * Atualiza o sessionStorage e notifica os assinantes.
   */
  private updateStorage(items: BoxItem[]): void {
    sessionStorage.setItem(this.storageKey, JSON.stringify(items));
    this.itemsSubject.next(items);
  }

  /**
   * Adiciona um item ao carrinho.
   */
  addItem(item: BoxItem): void {
    let items = this.getItemsFromStorage();
    const existingItem = items.find(i => i._id === item._id);

    if (existingItem) {
      // Atualiza a quantidade sem duplicar o item
      existingItem.quantity += 1;
    } else {
      items.push(item);
    }

    this.updateStorage(items);
  }


  /**
   * Atualiza um item no carrinho.
   */
  updateItem(updatedItem: BoxItem): void {
    let items = this.getItemsFromStorage();
    items = items.map((item) => (item._id === updatedItem._id ? { ...item, quantity: updatedItem.quantity } : item));
    this.updateStorage(items);
  }
/**
 * Atualiza um item no sessionStorage sem emitir o evento para evitar recarga da UI.
 */
private updateStorageSilent(items: BoxItem[]): void {
  sessionStorage.setItem(this.storageKey, JSON.stringify(items));
}

  /**
   * Remove um item pelo ID.
   */
  removeItem(id: string): void {
    let items = this.getItemsFromStorage();
    items = items.filter((item) => item._id !== id);
    this.updateStorage(items);
  }

  /**
   * Obtém todos os itens do carrinho.
   */
  getItems(): BoxItem[] {
    return this.getItemsFromStorage();
  }

  /**
   * Limpa todos os itens do carrinho.
   */
  clearBox(): void {
    sessionStorage.removeItem(this.storageKey);
    this.itemsSubject.next([]);
  }
}

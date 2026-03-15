import localforage from "localforage";

export interface Product {
  id: string;
  name: string;
  barcode: string;
  unit: string;
  category: string;
  quantity: number;
  minStock: number;
}

export interface Movement {
  id: string;
  productId: string;
  type: "entrada" | "saida";
  quantity: number;
  date: string;
  responsible: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: "admin" | "employee";
}

const productsDb = localforage.createInstance({
  name: "merenda_db",
  storeName: "products",
});
const movementsDb = localforage.createInstance({
  name: "merenda_db",
  storeName: "movements",
});
const usersDb = localforage.createInstance({
  name: "merenda_db",
  storeName: "users",
});

// Initialize DB with default admin if empty
export const initDb = async () => {
  const users = await getUsers();
  if (users.length === 0) {
    await saveUser({
      id: crypto.randomUUID(),
      name: "Administrador",
      username: "admin",
      password: "123",
      role: "admin",
    });
  }
};

// Users
export const getUsers = async (): Promise<User[]> => {
  const users: User[] = [];
  await usersDb.iterate((value: User) => {
    users.push(value);
  });
  return users;
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  const users = await getUsers();
  return users.find((u) => u.username === username) || null;
};

export const getUserById = async (id: string): Promise<User | null> => {
  return await usersDb.getItem<User>(id);
};

export const saveUser = async (user: User): Promise<void> => {
  await usersDb.setItem(user.id, user);
};

export const deleteUser = async (id: string): Promise<void> => {
  await usersDb.removeItem(id);
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  const products: Product[] = [];
  await productsDb.iterate((value: Product) => {
    products.push(value);
  });
  return products;
};

export const getProductByBarcode = async (
  barcode: string,
): Promise<Product | null> => {
  const products = await getProducts();
  return products.find((p) => p.barcode === barcode) || null;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  return await productsDb.getItem<Product>(id);
};

export const saveProduct = async (product: Product): Promise<void> => {
  await productsDb.setItem(product.id, product);
};

export const updateProductStock = async (
  id: string,
  newQuantity: number,
): Promise<void> => {
  const product = await getProductById(id);
  if (product) {
    product.quantity = newQuantity;
    await saveProduct(product);
  }
};

// Movements
export const getMovements = async (): Promise<Movement[]> => {
  const movements: Movement[] = [];
  await movementsDb.iterate((value: Movement) => {
    movements.push(value);
  });
  return movements.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
};

export const saveMovement = async (movement: Movement): Promise<void> => {
  await movementsDb.setItem(movement.id, movement);
};

// Backup
export const exportDatabase = async () => {
  const products = await getProducts();
  const movements = await getMovements();
  const users = await getUsers();
  return JSON.stringify({ products, movements, users });
};

export const importDatabase = async (jsonData: string) => {
  const data = JSON.parse(jsonData);
  await productsDb.clear();
  await movementsDb.clear();
  await usersDb.clear();

  if (data.products) {
    for (const p of data.products) {
      await productsDb.setItem(p.id, p);
    }
  }
  if (data.movements) {
    for (const m of data.movements) {
      await movementsDb.setItem(m.id, m);
    }
  }
  if (data.users) {
    for (const u of data.users) {
      await usersDb.setItem(u.id, u);
    }
  } else {
    await initDb();
  }
};

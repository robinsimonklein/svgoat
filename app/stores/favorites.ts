export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = useLocalStorage<string[]>('favorites', []);

  const add = (name: string) => {
    const favoritesSet = new Set(favorites.value);
    favoritesSet.add(name);
    favorites.value = Array.from(favoritesSet.values());
  };

  const remove = (name: string) => {
    const favoritesSet = new Set(favorites.value);
    favoritesSet.delete(name);
    favorites.value = Array.from(favoritesSet.values());
  };

  const toggle = (name: string) => {
    const favoritesSet = new Set(favorites.value);
    if (favoritesSet.has(name)) {
      remove(name);
    } else {
      add(name);
    }
  };

  return { favorites, add, remove, toggle };
});

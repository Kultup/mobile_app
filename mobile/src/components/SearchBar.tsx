import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Searchbar} from 'react-native-paper';
import {rp} from '../utils/responsive';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Пошук...',
  onSearch,
  debounceMs = 500,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    setDebounceTimer(timer);
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: rp(16),
    paddingVertical: rp(8),
  },
  searchbar: {
    elevation: 2,
  },
});

export default SearchBar;


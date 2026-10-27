import { useContext } from 'react';
import {
  LibraryContext,
  type LibraryContextValue,
} from '../context/libraryContext';

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary deve ser usado dentro de LibraryProvider.');
  }
  return context;
}

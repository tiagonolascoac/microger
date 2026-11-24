import { addDoc, collection, doc, onSnapshot, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../firebase/client';
import { DEFAULT_FINANCE_CATEGORIES } from './categoryHelpers';

export const categoriesRef = (orgId, spaceId) => collection(db, 'organizations', orgId, 'workspaces', spaceId, 'financeCategories');
const setupRef = (orgId, spaceId) => doc(db, 'organizations', orgId, 'workspaces', spaceId, 'financeCategoryConfig', 'initialization');

// Inicializa categorias em espaços novos e existentes, uma vez só.
// O marcador + as categorias são gravados numa única transação atômica.
export function initializeFinanceCategories(orgId, spaceId, userId) {
  return runTransaction(db, async tx => {
    const setup = await tx.get(setupRef(orgId, spaceId));
    if (setup.exists()) return;
    for (const category of DEFAULT_FINANCE_CATEGORIES) {
      tx.set(doc(categoriesRef(orgId, spaceId), category.id), {
        name: category.name,
        type: category.type,
        active: true,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    tx.set(setupRef(orgId, spaceId), {
      initialized: true,
      schemaVersion: 1,
      createdBy: userId,
      createdAt: serverTimestamp(),
    });
  });
}

export async function createFinanceCategory(orgId, spaceId, userId, name, type) {
  return addDoc(categoriesRef(orgId, spaceId), {
    name, type, active: true,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateFinanceCategory(orgId, spaceId, categoryId, changes) {
  return updateDoc(doc(categoriesRef(orgId, spaceId), categoryId), {
    ...changes, updatedAt: serverTimestamp(),
  });
}

export function useFinanceCategories(orgId, spaceId, userId) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let snapshotReady = false;
    let initializationReady = false;
    setCategories([]);
    setLoading(true);
    setError('');
    const complete = () => {
      if (active && snapshotReady && initializationReady) setLoading(false);
    };
    const unsubscribe = onSnapshot(categoriesRef(orgId, spaceId), snapshot => {
      if (!active) return;
      setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
      snapshotReady = true;
      complete();
    }, e => { if (active) { setError(e.message); setLoading(false); } });

    initializeFinanceCategories(orgId, spaceId, userId).then(() => {
      initializationReady = true;
      complete();
    }).catch(e => { if (active) { setError(e.message); setLoading(false); } });

    return () => { active = false; unsubscribe(); };
  }, [orgId, spaceId, userId]);

  return { categories, loading, error };
}

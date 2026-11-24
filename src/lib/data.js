import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase/client';
import { makeWorkspace } from '../config/templates';

export const workspaceRef = (orgId, spaceId) => doc(db, 'organizations', orgId, 'workspaces', spaceId);
export const transactionsRef = (orgId, spaceId) => collection(db, 'organizations', orgId, 'workspaces', spaceId, 'financeTransactions');

export async function createOrganization(ownerId, name) {
  const cleaned = name.trim();
  if (!cleaned || cleaned.length > 80) throw new Error('Informe um nome de até 80 caracteres.');
  return addDoc(collection(db, 'organizations'), {
    name: cleaned, ownerId, createdAt: serverTimestamp(),
  });
}

export async function createWorkspace(orgId, templateId, name, ownerId) {
  return addDoc(collection(db, 'organizations', orgId, 'workspaces'), {
    ...makeWorkspace(templateId, name, ownerId),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateWorkspace(orgId, spaceId, changes) {
  return updateDoc(workspaceRef(orgId, spaceId), { ...changes, updatedAt: serverTimestamp() });
}

export async function uploadWorkspaceLogo(orgId, spaceId, file) {
  if (!file) throw new Error('Selecione uma imagem.');
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    throw new Error('Use PNG, JPG ou WebP.');
  }
  if (file.size >= 2 * 1024 * 1024) throw new Error('A logo deve ter menos de 2 MB.');
  const logoPath = `organizations/${orgId}/workspaces/${spaceId}/branding/logo`;
  await uploadBytes(ref(storage, logoPath), file, { contentType: file.type });
  await updateWorkspace(orgId, spaceId, { logoPath });
  return logoPath;
}

export async function resolveLogo(path) {
  if (!path) return null;
  return getDownloadURL(ref(storage, path));
}

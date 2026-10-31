import * as addressRepo from "../repositories/addressRepository.js";
import { AppError } from "../utils/AppError.js";

export const listAddresses = (userId) => addressRepo.listAddresses(userId);
export const createAddress = (userId, payload) => addressRepo.createAddress(userId, payload);
export const setDefaultAddress = (userId, id) => addressRepo.setDefaultAddress(userId, id);
export const removeAddress = (userId, id) => addressRepo.removeAddress(userId, id);

export async function updateAddress(userId, id, updates) {
  const existing = await addressRepo.getAddress(userId, id);
  if (!existing) throw AppError.notFound("Address not found.");
  return addressRepo.updateAddress(userId, id, updates);
}

export async function assertOwnedAddress(userId, id) {
  const address = await addressRepo.getAddress(userId, id);
  if (!address) throw AppError.badRequest("Select a valid shipping address to continue.", "INVALID_ADDRESS");
  return address;
}

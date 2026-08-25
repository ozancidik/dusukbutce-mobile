export interface AppUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  birthDate: string;
  isAdmin: boolean;
}

export function appUserFromJson(json: any): AppUser {
  return {
    id: json.id ?? json._id ?? '',
    email: json.email ?? '',
    name: json.name ?? '',
    phone: json.phone ?? '',
    birthDate: json.birthDate ?? '',
    isAdmin: Boolean(json.isAdmin),
  };
}

import { object, string, nativeEnum, date, TypeOf } from "zod";
import validator from "validator";

import { User } from "@/db/user.entity";
import { gender_enum, userRole } from "@/enum/user.enum";
import {  AppDataSource } from "@/configs/db.config";

// initializing the repository
const userRepo = AppDataSource.getRepository(User);

export const createUserSchema = object({
  body: object({
    userData: object({
      firstName: string({
        required_error: "User First name is required",
      }),
      middleName: string({
        required_error: "User Middle name is required",
      }),
      lastName: string({
        required_error: "User Last name is required",
      }),
      phoneNumber: string({
        required_error: "Your Phone-number is required",
      }).refine((phoneNo) => validator.isMobilePhone(phoneNo), {
        message: "Invalid phone number",
      }),
      email: string({
        required_error: "Email is required",
      })
        .email("Not a valid email address")
        .refine((email) => validator.isEmail(email), {
          message: "Invalid mail format",
        })
        .refine(
          async (email) => {
            const existingUser = await userRepo.findOneBy({ email });
            return !existingUser;
          },
          {
            message: "This Email already exists and cannot be used for Signup",
          }
        ),
      nin: string({
        required_error: "Your Nin number is required",
      })
        .length(11, "The Nin must be an 11 digit number")
        .regex(/^\d{11}$/, "NIN must contain only digits")
        .refine(
          async (nin) => {
            const existingUser = await userRepo.findOneBy({ nin });
            return !existingUser;
          },
          { message: `This Nin is already in use` }
        ),
      gender: nativeEnum(gender_enum, {
        required_error: "Please select your gender",
        invalid_type_error: "Invalid gender",
      }),
      bvn: string({
        required_error: "Your Bvn is required",
      })
        .length(11, "The BVN must be an 11-digit number")
        .regex(/^\d{11}$/, "BVN must contain only digits")
        .refine(
          async (bvn) => {
            const existingUser = await userRepo.findOneBy({ bvn });
            return !existingUser;
          },
          {
            message: `This User's BVN is already in use.`,
          }
        ),
      date_of_birth: string({
        required_error: "Your Date of Birth is required",
      })
        .refine((dob) => !isNaN(Date.parse(dob)), { // Ensure it's a valid date string
          message: "Invalid date format",
        })
        .transform((dob) => new Date(dob)) // Convert string to Date object
        .refine(
          (dob) => {
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            const hasHadBdayThisYr =
              today.getMonth() > dob.getMonth() ||
              (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
            return age > 17 || (age === 17 && hasHadBdayThisYr);
          },
          {
            message: "You must be at least 17 years old to sign up",
          }
        ),
      role: nativeEnum(userRole, {
        required_error: "User role is required",
        invalid_type_error: "Invalid role",
      }).default(userRole.Customer),
      password: string({
        required_error: "Password is required",
      })
        .min(8, "Password is too short - should be 8 characters minimum")
        .max(12, "Password must not be more than 12 characters long")
        .regex(
          /[A-Z]/,
          "Password must contain at least one or more uppercase letters"
        )
        .regex(
          /[a-z]/,
          "Password must contain at least one or more lowercase letters"
        )
        .regex(/[0-9]/, "Password must contain at least one or more numbers")
        .regex(
          /[\W_]/,
          "Password must contain at least one or more special characters"
        ),
      confirmPassword: string({
        required_error: "Confirm your password",
      }),
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
  }),
});


export const loginUserSchema = object({
  body: object({
    phoneNumber: string({
      required_error: "Your Phone-number is required"
    })
      .refine((phoneNo) => validator.isMobilePhone(phoneNo), {
        message: "Invalid phone number: "
      }),
    password: string({
      required_error: "Password is required",
    }),
  }),
});



export type CreateUserInput = TypeOf<typeof createUserSchema>;
export type LoginSchema = TypeOf<typeof loginUserSchema>;
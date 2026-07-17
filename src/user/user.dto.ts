import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    ValidateNested
} from 'class-validator';

import { Transform } from 'class-transformer';

export class AddressDTO {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value.trim())
    street!: string;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    houseNumber?: number;
}
export class UserDTO {
    @IsString()
    @IsNotEmpty({groups: ['create']})
    name!: string;

    @IsOptional()
    @IsString()
    bio: string | undefined;

    @ValidateNested()
    address!: AddressDTO;
}
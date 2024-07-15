import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dto/output.dto";
import { Verification } from "../entities/verfication.entity";

@ObjectType()
export class VerifyEmailOutput extends CoreOutput {

}

@InputType()
export class VerifyEmailInput extends PickType(Verification, ["code"]){

}
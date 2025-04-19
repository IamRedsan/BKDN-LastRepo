import { Language, Theme } from 'src/common/enums/user-option.enum';

export class UpdateUserSettingRequestDto {
  language: Language;
  theme: Theme;
}

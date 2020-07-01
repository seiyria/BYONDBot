
import { Inject } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { RefDatabaseService } from '../services/ref-database';

export class RefCommand implements ICommand {

  static help = 'Search all of the DM Reference entries with a command!';

  aliases = ['ref'];

  @Inject private databaseService: RefDatabaseService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const res = this.databaseService.searchRef(args);
    if (!res) {
      message.reply(`Could not find an entry like "${args}" - try again?`);
      return {};
    }

    try {
      const embed = new Discord.RichEmbed()
        .setURL(res.link)
        .setTitle(`\`${res.path}\` @ DM Reference`)
        .setAuthor(res.name)
        .setDescription(res.description.substring(0, 2048));

      if (res.extraCategories.length > 0) {
        res.extraCategories.forEach((cat) => embed.addField(cat.name, cat.text));
      }

      if (res.examples.length > 0) {
        embed.addField('Examples', res.examples.join('\n'));
      }

      message.channel.send({ embed });

    } catch (e) {
      message.reply(`Some internal error happened, not that I know what that means, b-b-baka! But here it is: "${e.message}"`);

    }

    return { resultString: args };
  }
}

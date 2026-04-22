import type { Request, Response } from "express";

// Clerk
import { verifyWebhook } from '@clerk/express/webhooks';

// Types
import type { UserService } from "@/modules/user/user.service.ts";


export class AuthController {

  constructor(private readonly userService: UserService) { }

  handleSyncClerkUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const event = await verifyWebhook(req);

      switch (event.type) {
        case 'user.created':
        case 'user.updated': {
          const { id, email_addresses, primary_email_address_id, first_name, last_name } = event.data;

          const primaryEmailAddress = email_addresses.find(addr => addr.id === primary_email_address_id)

          if (!primaryEmailAddress) {
            console.warn({ userId: id, event: event.type },
              'Clerk webhook: no primary email found — skipping sync',
            );

            res.status(200).json({ received: true }); // edge case
            return;
          }

          await this.userService.syncUserProfile({
            id,
            email: primaryEmailAddress.email_address,
            firstName: first_name ?? '',
            lastName: last_name ?? '',
          });

          console.info(
            { userId: id, event: event.type },
            'Clerk user synced into local DB',
          );

          break;
        }

        case 'user.deleted': {
          const { id } = event.data;

          if (!id) {
            console.warn(
              { event: event.type },
              'Clerk user deleted: no user ID found — skipping sync',
            );

            res.status(200).json({ received: true });
            return;
          }

          await this.userService.deleteUserById(id);

          console.info(
            { userId: id, event: event.type },
            'Clerk user deleted from local DB',
          );

          break;
        }

        default:
          break;
      }

      res.status(200).json({ received: true });

    } catch (error) {
      console.error({ error }, 'Clerk webhook verification failed');
      res.status(400).json({ error: 'Webhook verification failed' });
    }
  }
}

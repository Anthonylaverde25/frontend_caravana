import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiPartnerRepository } from '@/core/partners/infrastructure/repositories/ApiPartnerRepository';
import { PartnerContactInput } from '@/core/partners/domain/entities/PartnerContact';

/**
 * Contact persons of a partner (C6–C9). Every action refreshes the partner lists, since they show
 * the default contact.
 */
const useContactMutation = <TVariables, TResult>(
	mutationFn: (repository: ApiPartnerRepository, variables: TVariables) => Promise<TResult>
) => {
	const queryClient = useQueryClient();
	const repository = new ApiPartnerRepository();

	return useMutation({
		mutationFn: (variables: TVariables) => mutationFn(repository, variables),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['partners'] });
		}
	});
};

export const useAddPartnerContact = () =>
	useContactMutation((repository, { partnerId, contact }: { partnerId: number; contact: PartnerContactInput }) =>
		repository.addContact(partnerId, contact)
	);

export const useUpdatePartnerContact = () =>
	useContactMutation(
		(
			repository,
			{ partnerId, contactId, contact }: { partnerId: number; contactId: number; contact: PartnerContactInput }
		) => repository.updateContact(partnerId, contactId, contact)
	);

export const useSetDefaultPartnerContact = () =>
	useContactMutation((repository, { partnerId, contactId }: { partnerId: number; contactId: number }) =>
		repository.setDefaultContact(partnerId, contactId)
	);

export const useRemovePartnerContact = () =>
	useContactMutation((repository, { partnerId, contactId }: { partnerId: number; contactId: number }) =>
		repository.removeContact(partnerId, contactId)
	);

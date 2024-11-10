export const load = async ({ locals }: { locals: App.Locals }) => {
  return {
    session: locals.session
  };
};

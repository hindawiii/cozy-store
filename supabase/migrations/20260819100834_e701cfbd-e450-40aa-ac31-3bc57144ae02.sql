DROP POLICY "anyone reads active products" ON public.products;
CREATE POLICY "public reads active products" ON public.products FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "staff reads all products" ON public.products FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
DROP FUNCTION IF EXISTS public.get_storefront(uuid);

CREATE OR REPLACE FUNCTION public.get_storefront(p_seller uuid)
RETURNS TABLE (
  store_name text,
  city text,
  product_id uuid,
  name text,
  emoji text,
  image_url text,
  category text,
  description text,
  price numeric,
  rating numeric,
  stock integer
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COALESCE(pr.store_name, 'متجر بايع') AS store_name,
    pr.city,
    p.id AS product_id,
    p.name,
    p.emoji,
    p.image_url,
    p.category,
    p.description,
    COALESCE(sp.custom_price, p.selling_price) AS price,
    p.rating,
    p.stock
  FROM public.store_products sp
  JOIN public.products p ON p.id = sp.product_id AND p.is_active = true
  LEFT JOIN public.profiles pr ON pr.id = sp.user_id
  WHERE sp.user_id = p_seller
  ORDER BY p.name;
$$;

REVOKE EXECUTE ON FUNCTION public.get_storefront(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_storefront(uuid) TO anon, authenticated, service_role;
class VariantsController < ApplicationController
  before_action :set_variant, only: %i[ show update destroy ]

  # GET /variants
  def index
    @variants = Variant.includes(:product, images_attachments: :blob).all
    render json: VariantBlueprint.render(@variants, root: "variants")
  end

  # GET /variants/:sku
  def show
    render json: VariantBlueprint.render(@variant)
  end

  # POST /variants
  def create
    @variant = Variant.new(variant_params)

    if @variant.save
      # Attach images if present
      if params[:images]
        Array(params[:images]).each { |image| @variant.images.attach(image) }
      end

      render json: VariantBlueprint.render(@variant), status: :created
    else
      Rails.logger.error "Variant save failed: #{@variant.errors.full_messages.inspect}"
      render json: @variant.errors.full_messages, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /variants/:sku
  def update
    if @variant.update(variant_params)
      # Attach new images if present
      if params[:images]
        Array(params[:images]).each { |image| @variant.images.attach(image) }
      end

      render json: VariantBlueprint.render(@variant), status: :ok
    else
      Rails.logger.error "Variant update failed: #{@variant.errors.full_messages.inspect}"
      render json: @variant.errors.full_messages, status: :unprocessable_entity
    end
  end

  # DELETE /variants/:sku
  def destroy
    @variant.destroy!
    render json: { message: "Variant deleted successfully" }, status: :ok
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_variant
    @variant = Variant.includes(:product, images_attachments: :blob).find_by!(sku: params[:sku])
  end

  def variant_params
    params.require(:variant).permit(:sku, :color, :size, :variant_stock, :product_id)
  end
end

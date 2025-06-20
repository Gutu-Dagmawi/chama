require "rails_helper"

RSpec.describe ProductsController, type: :routing do
  describe "routing" do
    it "routes to #index" do
      expect(get: "/shoes").to route_to("shoes#index")
    end

    it "routes to #show" do
      expect(get: "/shoes/1").to route_to("shoes#show", id: "1")
    end


    it "routes to #create" do
      expect(post: "/shoes").to route_to("shoes#create")
    end

    it "routes to #update via PUT" do
      expect(put: "/shoes/1").to route_to("shoes#update", id: "1")
    end

    it "routes to #update via PATCH" do
      expect(patch: "/shoes/1").to route_to("shoes#update", id: "1")
    end

    it "routes to #destroy" do
      expect(delete: "/shoes/1").to route_to("shoes#destroy", id: "1")
    end
  end
end

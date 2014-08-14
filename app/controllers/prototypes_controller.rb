class PrototypesController < ApplicationController
  def fetch
    params[:prototype_id] == "all" ? @prototype_by_query = Prototype.all : @prototype_by_query = Prototype.where("id = " + params[:prototype_id])
    render json: @prototype_by_query, root: false
    # find JSON definition in the serializer
  end
end
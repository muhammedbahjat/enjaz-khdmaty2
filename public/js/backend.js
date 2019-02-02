$(document).ready(function () {

    // get order details by click
    $('.show-order').on("click", function(){
        $.ajax({
            url:$(this).attr("href"),
            contentType: 'application/json',
            success: function(response){
                var table = $('#orders-table');
                table.html(' ');
                response[0].forEach(function(result){
                    table.append('\
                    <tr>\
                    <td>'+ result.Id +'</td>\
                    <td>'+ result.item_name +'</td>\
                    <td>'+ result.category_name +'</td>\
                    <td>'+ result.quantity +'</td>\
                    <td>'+ result.subtotal +'</td>\
                    <td>'+ result.subtotal * result.quantity +'</td>\
                    <tr>\
                    ');
                })
                $('#orderID').val(response[1][0].customer_name);
                $('#phone').val(response[1][0].customer_phone);
                $('#address').val(response[1][0].address);
                $('#orderTime').val(response[1][0].date_create);
                $('#amount').val(response[1][0].final_cost);
                $("#button-accept").attr("href", "/orders/accept/" + response[1][0].uuid + "/main");
                $("#button-reject").attr("href", "/orders/reject/" + response[1][0].uuid + "/main");
                $("#button-accept-orders").attr("href", "/orders/accept/" + response[1][0].uuid + "/orders");
                $("#button-reject-orders").attr("href", "/orders/reject/" + response[1][0].uuid + "/orders");
                $("#finalCost").html(' ').append('اجمالي المبلغ : ' + response[1][0].final_cost );
            }
        });
    });

    // get  item details by click
    $('.show-item').on("click", function(){
        $.ajax({
            url:$(this).attr("href"),
            contentType: 'application/json',
            success: function(response){
                var selectCategory = $('#itemCategory');
                selectCategory.html(' ');
                response[1].forEach(function(result){
                 if(result.uuid == response[0][0].category_uuid ){
                    selectCategory.append('\
                    <option value="'+ result.uuid  +'" selected>' +result.category_name+ '</option>\
                    ');
                 } else {
                    selectCategory.append('\
                    <option value="'+ result.uuid  +'">' +result.category_name+ '</option>\
                    ');
                 }
                
                    
                })
                $('#itemId').val(response[0][0].uuid);
                $('#itemImage').attr("src",response[0][0].item_image_path);
                $('#itemName').val(response[0][0].item_name);
                $('#itemImageEdit').val(response[0][0].item_image_path);
                $('#itemPrice').val(response[0][0].item_price);
                $('#itemDescription').val(response[0][0].item_description);
                $("#delete-item").attr("href", "/items/delete/" + response[0][0].uuid);
                $('#deleteItemAlert').html('').append(response[0][0].item_name);
                
            }
        });
    });

    // get category details by click
    $('.show-category').on("click", function(){
        $.ajax({
            url:$(this).attr("href"),
            contentType: 'application/json',
            success: function(response){
            
                $('#displayItemImage').attr("src","public/uploads/"+response[0].category_image);

                $('#editCategoryId').val(response[0].uuid);
                $('#editCategoryName').val(response[0].category_name);
                $('#categoryImage').val(response[0].category_image);
                
                $("#delete-category").attr("href", "/categories/delete/" + response[0].uuid);
                $('#deleteCategoryAlert').html('').append(response[0].category_name);
                
            }
        });
    });

    // get  categories of agent
    $('#add-button').on("click", function(){
        $.ajax({
            url:'/categories/get',
            contentType: 'application/json',
            success: function(response){
                var selectCategory = $('#addItemCategory');
                selectCategory.html(' ');
                response.forEach(function(result){
                    selectCategory.append('\
                    <option value="'+ result.uuid  +'" selected>' +result.category_name+ '</option>\
                    ');
                })
                
            }
        });
    })

    // submit add item form
    $("#addForm-button").on('click',function(){
        $("#addForm").submit();
    });

    // submit edit item form
    $("#editForm-button").on('click',function(){
        $("#editForm").submit();
    });

    // submit add category form
    $("#addCategoryForm-button").on('click',function(){
        $("#addCategoryForm").submit();
    });

    // submit edit category form
    $("#editCategoryForm-button").on('click',function(){
        $("#editCategoryForm").submit();
    });

    // submit login form
    $("#loginForm-button").on('click',function(){
        $("#loginForm").submit();
    });

    // register login form
    $("#registerform-button").on('click',function(){
        $("#registerForm").submit();
    });
});